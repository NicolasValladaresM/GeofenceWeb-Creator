
'use client'

import { Navigation } from "./components/Navigation"
import Image from 'next/image';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getFirebaseAuth } from './firebase/config';
import AuthProvider from './AuthProvider'
import {useRouter} from "next/navigation";
import { signOut} from "firebase/auth";

export default function RootLayout({ children }) {

  const router = useRouter() 
    const SingOut = () => {
        const auth = getFirebaseAuth();
       signOut(auth)
       router.push('/')
      };  

  const auth = getFirebaseAuth(); 
  const [user] = useAuthState(auth);

  if(user){
    router.push('../mapa')
  }
return (

  <AuthProvider>
  <html lang="es">
    <head>
      <title>Ubicación de usuario</title>
    </head>
    <body>
    {user && <Navigation />}

      {user && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className='logout-button' onClick={SingOut}>Cerrar sesión</button>
          <div style={{ position: 'relative' }}>
            <Image src="/images/image.png" alt="image" width={90} height={60} className='image' />
          </div>
        </div>
      )}

      {children}
    </body>
  </html>
</AuthProvider>

)
}