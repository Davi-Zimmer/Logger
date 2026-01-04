import fs from 'fs'
import path from 'path'
import url from "url"


enum LogLevel {
    'Info'    = 'Info',
    'Debug'   = 'Debug',
    'Warning' = 'Warning',
    'Error'   = 'Error',
    'Fatal'   = 'Fatal',
}


export interface DevConfigInterface {
    logEnabled          : boolean
    overwriteLogFile    : boolean
    logFileEnabled      : boolean
    consoleLogsEnabled  : boolean
}


class _Logger {

    private static Instance: _Logger

    private currentLogFilePath = this.getLogFile()

    public static GetInstance(){

        if ( !_Logger.Instance ) _Logger.Instance = new _Logger()

        _Logger.Instance.setup

        return _Logger.Instance
    }

    private debounce( func: () => void, delayMs: number ){
        
        let timeout: NodeJS.Timeout | null = null

        return () => {
                
        if( timeout ) clearTimeout( timeout )

            timeout = setTimeout( () => {

                func()

            }, delayMs )

        }

    }

    private AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAa"

    public lixo = "BOMDIA"

    private constructor() {
      

        // console.log( this.getDirName )
    }
    

    private getDirName(){
        
        const filePath = url.fileURLToPath( import.meta.url )

        const dirnamed = path.dirname( filePath )

        return dirnamed

    }

    private getDevConfig() {
        
        return {

        } as DevConfigInterface

    }

    private createLogFolder( logPath :string ){

        fs.mkdirSync( logPath )
        
    }

    private setup(){

        
    }

    private checkLogFolder(){

        const logPath = path.join( this.getDirName(), '../logs')

        if( !fs.existsSync(logPath) ){

            this.createLogFolder( logPath )

        }

    }

    private renameFile( logPath: string ){

        try {

            const data = fs.readFileSync( logPath ).toString()

            const match = data.match(/\{(.*?)\}/)
    
            const timestap = match?.[ 1 ].replaceAll(' ', '') || new Date().toISOString()
    
            const newName = path.join( this.getDirName(), `../logs/${timestap}.log`)
    
            fs.renameSync( logPath, newName )

        } catch ( ex ){
            console.error( ex )
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

    private getLogFile(){
        
        this.checkLogFolder()

        const devConfig = this.getDevConfig()

        try {
            const timestap = Date.now()
            
            const logPath = path.join( this.getDirName(), `../logs/latest.log`)

            const exists = fs.existsSync( logPath )
    
            if( exists && !devConfig.overwriteLogFile ) this.renameFile( logPath )
    
            if( !devConfig.logFileEnabled ) return
    
            fs.writeFileSync( logPath, `{ ${ timestap } }\n` )
    
            this.currentLogFilePath = logPath

            return logPath

        } catch ( ex ) {

            console.error( ex )

        }

    }

    private logText = ''

    private saveLog = this.debounce( ( ) => {

        if( this.currentLogFilePath ){

            fs.appendFileSync( this.currentLogFilePath, this.logText )
            
            this.logText = ''

        }

    }, 500)

    private echo( echoType: LogLevel, message: string ){
      
        try {

            const devConfig = this.getDevConfig()

            const timestap = this.getCurrentTime()

            const commonData = `[ ${echoType} ] : ${ message }`

            this.logText += `[ ${timestap} ]${commonData}\n`

            this.saveLog()
          
            if( devConfig.consoleLogsEnabled ) console.log( commonData )

        } catch ( ex ){

            console.error( ex )
            
        } 
        
    }
 
    public setDevConfig( devConfigGetter: () => DevConfigInterface ){
        
        this.getDevConfig = devConfigGetter

    }

    public debug( msg: string ){

        this.echo( LogLevel.Debug , msg )

    } 

    public info( msg: string ){

        this.echo( LogLevel.Info, msg )

    }

    public warn( msg: string ){

        this.echo( LogLevel.Warning, msg )

    }

    public error( msg: string, error: Error ){
        
        this.echo( LogLevel.Error, `${msg}\n  → ${error.name}: ${error.message}\n  ↪ ${error.stack}`)
        
    }

    public fatal( msg: string | Error ){

        this.echo( LogLevel.Fatal, msg.toString() )
        
    }

}

const Logger = _Logger.GetInstance()


export default Logger