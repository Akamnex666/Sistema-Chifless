  import { redirect } from 'next/navigation';

  export default function Home() {
    // Redirige desde la raíz hacia /login para que la URL sea /login
    redirect('/login');
  }

