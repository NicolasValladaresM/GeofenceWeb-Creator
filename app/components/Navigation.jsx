'use client'
import Link from 'next/link'
import styles from './Navigation.module.css'
import { useRouter } from "next/navigation";
import { useAuthState } from 'react-firebase-hooks/auth';
import { getFirebaseAuth } from '../firebase/config';

import '../firebase/config'

const links=[{
  label:'Home',
  route: '/'
},{
  label:'Mapa',
  route: '/mapa'

}
]
export function Navigation (){

  const auth = getFirebaseAuth(); 
  const [user] = useAuthState(auth)
  const router = useRouter()
  if(user){
      router.push('../mapa')
  }
  

  return (
    <header className={styles.header}>
      
      <nav>
        <ul className={styles.navigation}>
          {links.map(({ label, route }) => (
            <li key={route}>
              <Link className={styles.Link} href={user ? route : '/'}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
    </header>
  );

}