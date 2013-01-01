(ns sh.bob.kod.server.cmds)

(defmulti dispatch-command
  (fn [chanel command version payload]
  [command version]))

(defmethod dispatch-command ["login" 1]
  [chanel command version payload]
  (println (format "looks like a login: %s" payload)))

(defn process-command
  [chanel command version payload]
  (println (format "Command: %s Version %s: Payload: %s" command version payload))
  (dispatch-command chanel command version payload))
