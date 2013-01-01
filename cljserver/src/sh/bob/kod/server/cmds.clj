(ns sh.bob.kod.server.cmds
  (:require [sh.bob.kod.server.log :as log]))

(defmulti dispatch-command
  (fn [chanel command version payload]
  [command version]))

(defmethod dispatch-command ["login" 1]
  [chanel command version payload]
  (log/debug (format "looks like a login: %s" payload)))

(defmethod dispatch-command ["register view" 1]
  [chanel command version payload]
  (log/debug (format "looks like a register view: %s" payload)))

(defmethod dispatch-command ["move" 1]
  [chanel command version payload]
  (log/debug (format "looks like a move: %s" payload)))

(defmethod dispatch-command ["change tile" 1]
  [chanel command version payload]
  (log/debug (format "looks like a change tile: %s" payload)))

(defn process-command
  [chanel command version payload]
  (log/debug "process-command" {:command command :version version :payload payload})
  (dispatch-command chanel command version payload))
