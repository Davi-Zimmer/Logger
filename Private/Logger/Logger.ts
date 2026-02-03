import fs from 'fs'
import path from 'path'
import url from "url"

interface DevConfigInterface {
    consoleLogsEnabled : boolean,
    logFileEnabled     : boolean,
    overwriteLogFile   : boolean
}

enum LogLevel {
    'Info'    = 'Info',
    'Debug'   = 'Debug',
    'Warning' = 'Warning',
    'Error'   = 'Error',
    'Fatal'   = 'Fatal'
}


class _Logger {

    private static Instance: _Logger

    public static GetInstance(){

        if( !this.Instance ) this.Instance = new _Logger()

        return this.Instance

    }

    private devConfig: DevConfigInterface | null = null

    private getDevConfig(){

        if( !this.devConfig ) throw new Error("Setup is required. Use Logger.Setup( F() => DevConfigInterface)")

        return this.devConfig
    }

    public setup( getDevConfig: () => DevConfigInterface ){
        
        this.devConfig = getDevConfig()

        this.currentLogFilePath = this.getLogFilePath()
    }

    private getDirName(){

        const filepath = url.fileURLToPath( import.meta.url )

        const dirname = path.dirname( filepath )

        return dirname

    }

    private createLogFolder(){
        
        const dirname = this.getDirName()
        
        const logFolder = path.join( dirname, '../Logs' )

        fs.mkdirSync( logFolder, {
            recursive: true
        })

        return logFolder

    }

    private renameLogFile( logPath: string ){

        if( !fs.existsSync(logPath) ){
            return
        }

        try {

            const data = fs.readFileSync( logPath ).toString()

            const match = data.match(/\{(.*?)\}/)
    
            const timestap = match?.[ 1 ].replaceAll(' ', '') || new Date().toISOString()
            
            const newName = path.join( this.getDirName(), `../Logs/${timestap}.log`)
    
            fs.renameSync( logPath, newName )

        } catch ( ex ){
            console.error( ex )
        }

    }

    private getLogFilePath(){

        const devConfig = this.getDevConfig()
        
        this.createLogFolder()


        try {
            const timestap = Date.now()
            
            const logPath = path.join( this.getDirName(), `../Logs/Latest.log`)

            const exists = fs.existsSync( logPath )
    
            
            if( exists && !devConfig.overwriteLogFile ) this.renameLogFile( logPath )
            
            if( !devConfig.logFileEnabled ) return logPath
            
            fs.writeFileSync( logPath, `{ ${ timestap } }\n` )

            this.currentLogFilePath = logPath


            return logPath

        } catch ( ex ) {

            console.error( ex )

            throw new Error("")

        }

    }

    private debounce( func: Function, delay: number ){
        let timeout: null | NodeJS.Timeout = null

        return ( args?: unknown ) => {
            if( timeout ) clearTimeout( timeout )
        
            timeout = setTimeout( () => {
                func( args )
            }, delay)
        }

    }

    private getCurrentTime(): string {
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(new Date())
    }

    public extractName( meta: ImportMeta ){

        const str = path.basename( meta.filename ) 

        return str.substring( 0, str.length - 3 ) + "> "
   
    }

    private logText = ""
    
    private currentLogFilePath = ""

    private saveLog = this.debounce( ( ) => {

        if( this.currentLogFilePath && this.getDevConfig().logFileEnabled ){

            fs.appendFileSync( this.currentLogFilePath, this.logText )
            
            this.logText = ''

        }

    }, 500)

    public echo( logLevel: LogLevel, message: string ){
        try {

            const timestap = this.getCurrentTime()

            this.logText += `[ ${timestap} ][ ${logLevel} ] : ${ message }\n`

            this.saveLog()

            if( this.getDevConfig().consoleLogsEnabled ) console.log( message )

        } catch ( ex ){
            console.error( ex )
        } 
        
    }

    public debug( meta: ImportMeta, msg: string ){

        this.echo( LogLevel.Debug , this.extractName( meta ) + msg )

    } 

    public info( meta: ImportMeta, msg: string ){

        this.echo( LogLevel.Info, this.extractName( meta ) + msg )

    }

    public warn( meta: ImportMeta, msg: string ){

        this.echo( LogLevel.Warning, this.extractName( meta ) + msg )

    }

    public error( meta: ImportMeta, msg: string, error?: Error ){
        
        let message = msg

        if( error ) message += `→ ${error.name}: ${error.message}\n  ↪ ${error.stack}\n`

        this.echo( LogLevel.Error, this.extractName( meta ) + `${message}\n`)
        
    }

    public fatal( meta: ImportMeta, msg: string | Error ){

        this.echo( LogLevel.Fatal, this.extractName( meta ) + msg.toString() )
        
    }


}


const Logger = _Logger.GetInstance()

export default Logger