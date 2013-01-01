(ns sh.bob.kod.server.core
  (:use clojure.walk)
  (:require [clojure.data.json :as json]
            [clojure.string :as s]
            [clojure.pprint :as pp]
            [sh.bob.kod.server.daemon :as daemon]))

(defn -main
  [& args]
  (daemon/start))
