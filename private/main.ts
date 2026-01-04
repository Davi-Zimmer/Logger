import Logger, { DevConfigInterface } from "./Logger.js";

Logger.setDevConfig(() => {

    return {
        consoleLogsEnabled : true,
        logEnabled         : true,
        logFileEnabled     : true,
        overwriteLogFile   : false
    } as DevConfigInterface

})

Logger.debug("debug")
Logger.info ("info")
Logger.error("erro", new Error('actual error'))
Logger.warn ("warn")
Logger.fatal("fatal")
