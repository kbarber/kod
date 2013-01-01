(ns sh.bob.kod.server.cmds
  (:require [sh.bob.kod.server.log :as log]
            [sh.bob.kod.server.users :as users]
            [clojure.data.json :as json]))

(defn send-message
  [chanel message]
  (let [json-message (json/write-str message)]
    (.send chanel json-message)))

(defn send-command
  [chanel command version payload]
  (send-message chanel {:c command :v version :p payload}))

(defmulti dispatch-command
  (fn [chanel command version payload]
  [command version]))

(defmethod dispatch-command ["login" 1]
  [chanel command version payload]
  (let [username (payload "username")
        password (payload "password")]
    (users/login username password)
    (send-command chanel "create view" 1 {})))

(defmethod dispatch-command ["register view" 1]
  [chanel command version payload]
  (let [width  (payload "width")
        height (payload "height")]
    (log/debug "TODO: register view" {:height height :width width})))

(defmethod dispatch-command ["move" 1]
  [chanel command version payload]
  (log/debug "TODO: move" payload))

(defmethod dispatch-command ["change tile" 1]
  [chanel command version payload]
  (log/debug "TODO: change tile" payload))

(defn process-command
  [chanel command version payload]
  (log/debug "process-command" {:command command :version version :payload payload})
  (dispatch-command chanel command version payload))
