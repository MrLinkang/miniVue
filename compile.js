//new Compile(el,vm)
class Compile {
    constructor(el, vm, options) {
        this.$options = options;
        this.$vm = vm;
        this.$el = document.querySelector(el);
        if (this.$el) {
            this.$fragment = this.node2Fragment(this.$el)
            this.compile(this.$fragment)
            //编译完成的结果追加到dom
            this.$el.appendChild(this.$fragment)
        }
    }
    node2Fragment(el) {
        const fragment = document.createDocumentFragment()
        let child;
        while (child = el.firstChild) {
            fragment.appendChild(child)
        }
        return fragment;
    }
    compile(fragment) {
        //开始遍历子元素，将特殊定义的语法翻译
        const childNode = fragment.childNodes;
        Array.from(childNode).forEach((node) => {
            //类型判断开始
            this.judgeType(node)
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }
        })
    }
    judgeType(node) {
        if (node.nodeType === 1) {
            
            const nodeAttrs = node.attributes;
            Array.from(nodeAttrs).forEach(attrs => {
                const attrsName = attrs.name;
                const attrsValue = attrs.value;
                //指令
                if (attrsName.indexOf('l-') == "0") {
                    const dir = attrsName.substring(2);
                    this[dir] && this[dir](node, attrsValue)
                }
                //事件
                if (attrsName.indexOf('@') == "0") {
                    const dir = attrsName.substring(1);
                    // this[dir]&&this[dir]()
                    this.eventHandler(node, dir, attrsValue)

                }
            })
            // this.update(node,this.$vm,RegExp.$1,"text")
        }
        if (node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)) {
            // console.log("文本的值为"+node.textContent)
            // node.textContent = this.$vm.$data[RegExp.$1]
            this.update(node, this.$vm, RegExp.$1, "text")
        }
    }
    //重点，update函数，使数据可以响应式
    update(node, vm, dataName, dir) {
        const updaterFn = this[dir + "Updater"]
        updaterFn && updaterFn(node, this.$vm[dataName])
        //依赖收集
        new Watcher(vm, dataName, value => {
            updaterFn && updaterFn(node, value)
        })
    }
    textUpdater(node, value) {
        node.textContent = value
    }
    text(node, dataName) {
        this.update(node, this.$vm, dataName, "text")

    }
    model(node, dataName) {
        this.update(node, this.$vm, dataName, "model")
        node.addEventListener("input", e => {
            this.$vm[dataName] = e.target.value
        })
    }
    modelUpdater(node, value) {
        node.value = value
    }
    eventHandler(node, eventtype, methodName) {
        let fn = this.$options.methods && this.$options.methods[methodName]
        if (methodName && fn) {
            node.addEventListener(eventtype, fn.bind(this.$vm))
        }
    }
}