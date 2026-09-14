// ==UserScript==
// @name         GardenGlitch Panel - Fixed Animals
// @namespace    GardenGlitch
// @version      1.1.0
// @description  GardenGlitch panel with permanent correct animal IDs
// @match        *://*/*
// @grant        none
// ==/UserScript==

(async()=>{
  'use strict';

  const URL='https://raw.githubusercontent.com/Oddossosososo/Garden-Glitch/cr-look-refresh/garden-glitch-panel.user.js';

  try{
    let code=await fetch(URL).then(r=>{
      if(!r.ok)throw Error('Panel download failed: '+r.status);
      return r.text();
    });

    // Replace the old animal dropdown directly in the panel source.
    code=code.replace(
      /<select id=animal class=s>.*?<\/select>/,
      `<select id=animal class=s>
        <option value=0>0 • Chick</option>
        <option value=1>1 • Hen</option>
        <option value=2>2 • Rooster</option>
        <option value=3>3 • Sheep</option>
        <option value=4>4 • Pig</option>
        <option value=5>5 • Donkey</option>
        <option value=6>6 • Duck</option>
        <option value=7>7 • Buffalo</option>
        <option value=8>8 • Cow</option>
      </select>`
    );

    // Make sure the mapping survives any panel rebuild.
    code += `
      (()=> {
        const names=[
          'Chick','Hen','Rooster','Sheep','Pig',
          'Donkey','Duck','Buffalo','Cow'
        ];

        const fixAnimals=()=>{
          const root=document.getElementById('ggHost')?.shadowRoot;
          const select=root?.querySelector('#animal');
          if(!select)return false;

          const current=select.value;

          select.innerHTML=names.map(
            (name,id)=>'<option value="'+id+'">'+id+' • '+name+'</option>'
          ).join('');

          select.value=
            [...select.options].some(o=>o.value===current)
              ? current
              : '0';

          return true;
        };

        if(!fixAnimals()){
          const timer=setInterval(()=>{
            if(fixAnimals())clearInterval(timer);
          },100);

          setTimeout(()=>clearInterval(timer),10000);
        }
      })();
    `;

    eval(code);

    console.log(
      '✅ GardenGlitch loaded with fixed animals:',
      '0 Chick, 1 Hen, 2 Rooster, 3 Sheep, 4 Pig,',
      '5 Donkey, 6 Duck, 7 Buffalo, 8 Cow'
    );

  }catch(err){
    console.error('❌ GardenGlitch failed:',err);
  }
})();
