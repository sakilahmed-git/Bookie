import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
const manrope=Manrope({subsets:["latin"],variable:"--font-manrope",display:"swap"});
export const metadata:Metadata={title:"Bookie — Your personal knowledge studio",description:"Turn notes, documents, and ideas into clear understanding, active study, and source-grounded answers.",applicationName:"Bookie",keywords:["learning","knowledge workspace","study","document understanding","flashcards","AI tutor"],icons:{icon:"/icon.svg",shortcut:"/icon.svg",apple:"/icon.svg"},openGraph:{title:"Bookie — Make knowledge stick",description:"A calmer, smarter space to understand information and make it yours.",type:"website"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={manrope.variable}>{children}</body></html>}
