import dynamic from 'next/dynamic';
import LoginComponent from './LoginComponent';

const DynamicLogin = dynamic(() => Promise.resolve(LoginComponent), {
  ssr: false,
});


const Login = () => <DynamicLogin />;
export default Login;