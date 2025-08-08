export namespace models {
	
	export class ModbusConfig {
	    enabled: boolean;
	    description: string;
	    addr: number;
	    value: number;
	    scale: number;
	    offset: number;
	    delta: number;
	    valueType: string;
	
	    static createFrom(source: any = {}) {
	        return new ModbusConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.enabled = source["enabled"];
	        this.description = source["description"];
	        this.addr = source["addr"];
	        this.value = source["value"];
	        this.scale = source["scale"];
	        this.offset = source["offset"];
	        this.delta = source["delta"];
	        this.valueType = source["valueType"];
	    }
	}

}

