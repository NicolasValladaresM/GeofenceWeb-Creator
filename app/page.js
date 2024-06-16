'use client'
import styles from './styles.css';
import { useRouter } from "next/navigation";


import { useAuthState } from 'react-firebase-hooks/auth';
import { getFirebaseAuth } from './firebase/config';


export default function Home() {

  const auth = getFirebaseAuth(); 
  const [user] = useAuthState(auth);

  const router = useRouter()

  const LoginClick = () => {
    router.push("./login");
  };

  return (
    <div>

  <div className='ContainerPage' style={{ display:'flex', justifyContent: 'center',alignItems:'center', height: '100vh' }}>
    <h3>Página de inicio</h3>
  </div>

       {!user && (
        <button
        style={{
          position: 'fixed',
          top: '5px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: '#2e2b36',
          color: '#fff',
          borderRadius: '4px',
          zIndex: 9999,
          }}
          onClick={LoginClick}
          >
            Iniciar sesión
          </button>
          )}
     

      
    </div>
    
  );









}
