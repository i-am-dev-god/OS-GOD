import React from 'react';

// Shared visual hierarchy; the surrounding app still owns its content and state.
export default function AppHeading({icon:Icon,eyebrow,title,description,aside}){
 return <header className="app-heading"><span className="app-heading-icon" aria-hidden="true"><Icon size={21} strokeWidth={1.7}/></span><div className="app-heading-copy"><span className="app-heading-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{aside&&<div className="app-heading-aside">{aside}</div>}</header>;
}
