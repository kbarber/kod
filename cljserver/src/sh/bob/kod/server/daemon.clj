(ns sh.bob.kod.server.daemon
  (:use clojure.walk)
  (:require [clojure.data.json :as json]
            [sh.bob.kod.server.cmds :as cmds]
            [sh.bob.kod.server.log :as log])
  (:import [org.webbitserver WebServer WebServers WebSocketHandler]
           [org.webbitserver.handler StaticFileHandler]))

(def webserver (atom nil))
(def chanels (atom '()))

(defn on-message
  [chanel json-message]
  (let [message (json/read-str json-message)]
    (cmds/process-command chanel (message "c") (message "v") (message "p"))))

(defn stop-server []
  (.stop @webserver)
  (reset! webserver nil))

(defn start
  []
  (reset! webserver
    (doto (WebServers/createWebServer 7777)
      (.add "/websocket"
        (proxy [WebSocketHandler] []
          (onOpen [c] (do
                  (log/debug "websocket opened" {:channel c})
                  (swap! chanels conj c)))
          (onClose [c] (do
                   (log/debug "websocket closed" {:channel c})
                   (swap! chanels (fn [v] (remove #(= %1 c) v)))))
          (onMessage [c j] (on-message c j))))
      (.add (StaticFileHandler. "./public"))
      (.start))))