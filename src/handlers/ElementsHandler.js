export default class ElementsHandler {


    constructor(ctx) {
        this.ctx = ctx;
        this.elements = [];
        this.groups={};
    }

    

    addElement(key, elem,groupKey=null){

        let i = this.elements.findIndex(e => { return (e && e.key) ? e.key === key : false });

        if (i === -1) {
            //console.log("Adding a new element");
            this.elements.push({ key, elem });


        } else {
            this.elements[i] = { key, elem };
        }

        if (groupKey!=null){

            if (!this.groups[groupKey]){
                this.groups[groupKey]=[];
            }
            this.groups[groupKey].push(key);
            
        }


        this.ctx.setState({ elements: this.elements });
    }

    removeElement(key){
        if (this.elements.length < 1) {
            return;
        }

        let i = this.elements.findIndex(e => {
            //console.log("e??",e);
            return e.key === key;
        });

        if (i !== -1) {
            this.elements.splice(i, 1);
            this.ctx.setState({ elements: this.elements });

        }
    }

    getElementByKey=(key)=>{
        let i=this.elements.findIndex(e => { return (e && e.key) ? e.key === key : false });
        return i===-1?null:this.elements[i].elem;
        
    }
    getElements = () => {
        return this.elements;
    }

}