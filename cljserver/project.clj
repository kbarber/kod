(defproject sh.bob/kod.server "0.1.0-SNAPSHOT"
  :description "Knights of Dischord Server"

  :url "http://bob.sh"

  :license {:name "ASL 2.0"
            :url "http://www.apache.org/licenses/LICENSE-2.0.html"}

  :dependencies [[org.clojure/clojure "1.4.0"]
                 ;; Webbit is used instead of ring or something else
                 ;; because of its websocket support primarily, not because I
                 ;; know better.
                 [org.webbitserver/webbit "0.4.14"]
                 ;; Lots of JSON going on here ...
                 [org.clojure/data.json "0.2.1"]
                 ;; We're wrapping this logging library for now in
                 ;; sh.bob.kod.server.log.
                 [org.clojure/tools.logging "0.2.4"]
                 ;; Include log4j so tools.logging has a target logger.
                 [log4j "1.2.16" :exclusions [javax.mail/mail
                                              javax.jms/jms
                                              com.sun.jdmk/jmxtools
                                              com.sun.jmx/jmxri]]
                 ;; Mongo db client support
                 [com.novemberain/monger "1.4.1"]]

  :main sh.bob.kod.server.core)
