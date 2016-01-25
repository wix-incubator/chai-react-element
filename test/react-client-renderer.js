/// <reference path="../../typings/tsd.d.ts"/>
import ReactDOM, {DOMComponent} from "react-dom";

export function isInBrowser(){ return (typeof window !== 'undefined'); }

export class ReactClientRenderer {

	mount() {
		this.stage = createStage();
		this.renderedInstances = [];
		document.body.appendChild(this.stage);
	}

	render(vdom, dontConnectToDom=false, containerNode) {
		if(!isInBrowser()){
			throw new Error("trying to render component instance not in browser - use render.server()");
		}

		if (!this.stage) {
			throw new Error("trying to render in an unmounted renderer - did you forget to call .mount()?");
		}

		var domNode = containerNode || document.createElement("div");
		if(!dontConnectToDom) {
			this.stage.appendChild(domNode);
		}
		var componentInstance = ReactDOM.render(vdom, domNode);
		if(this.renderedInstances.indexOf(componentInstance) === -1){
			this.renderedInstances.push(componentInstance);
		}
		return componentInstance;
	}

	cleanup() {
		this.renderedInstances.forEach(destroyComponent);
		this.renderedInstances = [];
		if(this.stage) {
			this.stage.innerHTML = "";
		}
	}

	destroy() {
		if (!this.stage) {
			throw new Error("trying to destroy an unmounted renderer - did you forget to call .mount()?");
		}

		document.body.removeChild(this.stage);
	}
}

function destroyComponent(componentInstance){
	ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(componentInstance).parentElement);
}

const StageIdAttribute = 'data-automation-id';
const StageId = 'stage';

function createStage(){
	const stage = document.createElement("div");
	stage.setAttribute(ReactClientRenderer.StageIdAttribute, ReactClientRenderer.StageId);
	return stage;
}
