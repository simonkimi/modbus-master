export namespace models {
	
	export class ModbusConfig {
	    id: string;
	    enabled: boolean;
	    description: string;
	    startAddr: number;
	    addrSize: number;
	    initValue: number[];
	    valueType: string;
	    byteOrder: string;
	    scale: number;
	    offset: number;
	    delta: number;
	
	    static createFrom(source: any = {}) {
	        return new ModbusConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.enabled = source["enabled"];
	        this.description = source["description"];
	        this.startAddr = source["startAddr"];
	        this.addrSize = source["addrSize"];
	        this.initValue = source["initValue"];
	        this.valueType = source["valueType"];
	        this.byteOrder = source["byteOrder"];
	        this.scale = source["scale"];
	        this.offset = source["offset"];
	        this.delta = source["delta"];
	    }
	}

}

