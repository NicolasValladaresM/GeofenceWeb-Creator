'use client'

import {useState, useEffect} from "react"
import { uid } from 'uid'
import { signOut,signInWithEmailAndPassword} from "firebase/auth";
import { useAuthState } from 'react-firebase-hooks/auth'
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "../firebase/config";
import './styles.css'

import '../firebase/config'



export default function Login() {

  

  const[email,setEmail] = useState("")
  const[password,setPassword] = useState("")
  
  const auth = getFirebaseAuth()
  const router = useRouter() 



    useEffect(() => {
    
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          router.push('../mapa');
        }
      });
  
      return () => unsubscribe();
    }, []);
 

  
  const signInC = async () => {



    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(user);
      if(user){
         router.push('../mapa');
      }else{
        router.push("/login");
      }
     
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode, errorMessage);
    }
  };

  return (
    <div className='Home'>
      
          <div>
                   
                    <br></br>

                    <input className="input-field" type="email" placeholder="Correo" id="email" onChange={(e)=>setEmail(e.target.value)}/>
                    <input className="input-field" type="password" placeholder="Contraseña" id="password" onChange={(e)=>setPassword(e.target.value)} 
                     onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        signInC();
                      }
                    }}/> 

                    <button className="button-button" onClick={signInC}>Iniciar sesión</button>
                    
                    
          </div>

            



    </div>
   
  )



}
