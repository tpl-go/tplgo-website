import { useEffect } from "react";

export default function useHoverMove(ref:any){

useEffect(()=>{

const el = ref.current;
if(!el) return;

let direction = 1;
let angle = 0;
let frameId:number;

const swing=()=>{

angle += 0.6 * direction;

if(angle>=15){
direction = -1;
}

if(angle<=-15){
direction = 1;
}

el.style.transform = `rotate(${angle}deg)`;

frameId=requestAnimationFrame(swing);
};

el.addEventListener("mouseenter",()=>{
frameId=requestAnimationFrame(swing);
});

el.addEventListener("mouseleave",()=>{
cancelAnimationFrame(frameId);
el.style.transform="rotate(0deg)";
});

return()=>{
cancelAnimationFrame(frameId);
};

},[]);

}