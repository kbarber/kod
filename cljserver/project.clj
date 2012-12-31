(defproject sh.bob/kod.server "0.1.0-SNAPSHOT"
  :description "Knights of Dischord server"
  :url "http://bob.sh"
  :license {:name "ASL 2.0"
            :url "http://www.apache.org/licenses/LICENSE-2.0.html"}
  :dependencies [[org.clojure/clojure "1.4.0"]
                 [org.webbitserver/webbit "0.4.14"]
                 [org.clojure/data.json "0.2.1"]
                 [ns-tracker "0.2.0"]]
  :main sh.bob.kod.server.core)
