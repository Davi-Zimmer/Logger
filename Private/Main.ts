import Logger from "./Logger/Logger.js";

Logger.setup(() => ({
    consoleLogsEnabled : true,
    logFileEnabled     : true,
    overwriteLogFile   : true
}))

Logger.debug(import.meta, "mensagem debug")
Logger.info (import.meta, "mensagem info")
Logger.error(import.meta, "erro", new Error('actual error'))
Logger.error(import.meta, "erro2")
Logger.warn (import.meta, "mensagem de warn")
throw Logger.fatal(import.meta, "cabo kk fatal")