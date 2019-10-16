//new Vue(el,data,lifesc,method)
class LinkVue{
    constructor(option){
        this.$el = option.el;
        this.$data = option.data;
        this.observe(this.$data)
        new Compile(this.$el,this)
    }
    observe(data){
        //判断传入数据的合法性
        if(data&&typeof(data)=="object"){
            //对data遍历
            Object.keys(data).forEach((key)=>{
                this.defineReactive(data,key,data[key])
            })
        }
    }
    defineReactive(data,key,value){
        //循环遍历data,直至不是一个对象
        this.observe(value)
        const dep = new Dep()
        Object.defineProperty(data,key,{
            get(){
                Dep.target&&dep.addDep(Dep.target)
                return value
            },
            set(newVal){
                if(value === newVal){
                    return
                }
                value = newVal
                dep.notify()
                // console.log(key+"更新成为了"+newVal)
            }
        })
    }
}
class Dep{
    constructor(){
        //数组里面存放的时watcher
        this.deps = []
    }
    addDep(dep){
        this.deps.push(dep)
    }
    notify(){
        this.deps.forEach((dep)=>dep.update())
    }

}

//Watcher
class Watcher{
    constructor(vm,key,callback){
        //将当前watcher的实例指定到Dep的静态属性target下
        this.vm = vm;
        this.key = key;
        this.callback = callback;
        Dep.target = this;
        this.vm.$data[this.key]//读一下，触发getter
        Dep.target = null;
    }
    update(){
        this.callback.call(this.vm,this.vm.$data[this.key])
    }
}