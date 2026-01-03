enum LogLevel  {
    'Info'  ,
    'Debug' ,
    'Warn'  ,
    'Fatal' ,
    'Error'
}

interface DevConfig {
    overrideLog : boolean
    logEnabled  : boolean
}


class _Logger {

    private static Instance: _Logger

    public static GetInstance(){

        if( !this.Instance ) this.Instance = new _Logger()

        return this.Instance

    }


    // ---------------------------- ------ ---------------------------- \\

    public logsToWrite: string = ''


    public echo( type: LogLevel, content:string ){
            

    }


    




}

const Logger = _Logger.GetInstance()

export default Logger