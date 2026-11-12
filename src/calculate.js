// A bounded arithmetic parser: no eval, identifiers, assignments or network calls.
export function calculate(input){
 const source=input.trim().replace(/^=/,'').replace(/[×]/g,'*').replace(/[÷]/g,'/');
 if(!source||source.length>160||!/^[\d\s.+\-*/()%]+$/.test(source))throw Error('Use numbers, +, −, ×, ÷, parentheses and %.');
 let i=0,depth=0;const skip=()=>{while(/\s/.test(source[i]||'')&&i<source.length)i++};
 function atom(){skip();if(++depth>32)throw Error('Expression is too deeply nested.');let n;const c=source[i];if(c==='+'||c==='-'){i++;n=atom()*(c==='-'?-1:1)}else if(c==='('){i++;n=sum();skip();if(source[i++]!==')')throw Error('Missing closing parenthesis.')}else{const m=source.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(!m)throw Error('Expected a number.');i+=m[0].length;n=Number(m[0])}skip();while(source[i]==='%'){n/=100;i++;skip()}depth--;return n}
 function product(){let n=atom();for(;;){skip();const op=source[i];if(op!=='*'&&op!=='/')return n;i++;const b=atom();if(op==='/'&&b===0)throw Error('Cannot divide by zero.');n=op==='*'?n*b:n/b}}
 function sum(){let n=product();for(;;){skip();const op=source[i];if(op!=='+'&&op!=='-')return n;i++;const b=product();n=op==='+'?n+b:n-b}}
 const result=sum();skip();if(i!==source.length)throw Error('Check the expression.');if(!Number.isFinite(result))throw Error('Result is out of range.');return Number(result.toPrecision(12));
}
const units={mm:['length',.001],cm:['length',.01],m:['length',1],km:['length',1000],in:['length',.0254],ft:['length',.3048],mi:['length',1609.344],g:['mass',.001],kg:['mass',1],oz:['mass',.028349523125],lb:['mass',.45359237],ml:['volume',.001],l:['volume',1],c:['temperature',1],f:['temperature',1]};
const aliases={meter:'m',meters:'m',metre:'m',metres:'m',kilometer:'km',kilometers:'km',kilometre:'km',kilometres:'km',mile:'mi',miles:'mi',feet:'ft',foot:'ft',inch:'in',inches:'in',gram:'g',grams:'g',kilogram:'kg',kilograms:'kg',pound:'lb',pounds:'lb',lbs:'lb',ounce:'oz',ounces:'oz',liter:'l',liters:'l',litre:'l',litres:'l',celsius:'c',fahrenheit:'f'};
export function convert(input){const m=input.trim().toLowerCase().match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*([a-z]+)\s+(?:to|in)\s+([a-z]+)$/);if(!m)return null;const from=aliases[m[2]]||m[2],to=aliases[m[3]]||m[3],a=units[from],b=units[to];if(!a||!b||a[0]!==b[0])return null;const x=Number(m[1]);const value=a[0]==='temperature'?(from===to?x:from==='c'?x*9/5+32:(x-32)*5/9):x*a[1]/b[1];if(!Number.isFinite(value))return null;return {value:Number(value.toPrecision(12)),unit:to}}
export function quickResult(input){const conversion=convert(input);if(conversion)return `${conversion.value} ${conversion.unit}`;if(!input.trim().startsWith('='))return null;try{return String(calculate(input))}catch{return null}}
