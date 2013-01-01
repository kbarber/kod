(ns sh.bob.kod.server.log
  (:require [clojure.tools.logging :as log]))

(defn- fmt-log
  "Format message + data combined output in a standard way"
  [msg data]
  (format "%s\n  %s" msg data))

(defn trace
  "Finest event logging, even finer then debugging"
  ([msg] (log/trace msg))
  ([msg data] (log/trace (fmt-log msg data))))

(defn debug
  "Fine grained events that only make sense to the developers"
  ([msg] (log/debug msg))
  ([msg data] (log/debug (fmt-log msg data))))

(defn info
  "User exposed events that are more about showing progress and information
  to the astute user"
  ([msg] (log/info msg))
  ([msg data] (log/info (fmt-log msg data))))

(defn warn
  "Potentially harmful situations, something the user should take heed of and
  try to remedy before it becomes a problem"
  ([msg] (log/warn msg))
  ([msg data] (log/warn (fmt-log msg data))))

(defn error
  "A problem has occurred, application can still run - but alas its a problem"
  ([msg] (log/error msg))
  ([msg data] (log/error (fmt-log msg data))))

(defn fatal
  "It broken - fix it"
  ([msg] (log/fatal msg))
  ([msg data] (log/fatal (fmt-log msg data))))
