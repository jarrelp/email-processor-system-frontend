import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';

// third-party
import jwtDecode from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'store/actions';
import accountReducer from 'store/accountReducer';

// project imports
import Loader from 'ui-component/Loader';
import axios from 'apis/backendApi';

// constant
const initialState = {
    isLoggedIn: false,
    isInitialized: false,
    user: null
};

const verifyToken = (serviceToken) => {
    if (!serviceToken) {
        return false;
    }
    const decoded = jwtDecode(serviceToken);
    /**
     * Property 'exp' does not exist on type '<T = unknown>(token, options?: JwtDecodeOptions | undefined) => T'.
     */
    return decoded.exp > Date.now() / 1000;
};

const setSession = (serviceToken) => {
    if (serviceToken) {
        localStorage.setItem('serviceToken', serviceToken);
        axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
    } else {
        localStorage.removeItem('serviceToken');
        delete axios.defaults.headers.common.Authorization;
    }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //
const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
    const [state, dispatch] = useReducer(accountReducer, initialState);

    useEffect(() => {
        const init = async () => {
            try {
                const serviceToken = window.localStorage.getItem('serviceToken');
                if (serviceToken && verifyToken(serviceToken)) {
                    setSession(serviceToken);
                    const response = await axios.get('/api/auth/me');
                    const { user } = response.data;
                    dispatch({
                        type: LOGIN,
                        payload: {
                            isLoggedIn: true,
                            user
                        }
                    });
                } else {
                    dispatch({
                        type: LOGOUT
                    });
                }
            } catch (err) {
                console.error(err);
                dispatch({
                    type: LOGOUT
                });
            }
        };

        init();
    }, []);

    const login = async (userName, password) => {
        const response = await axios.post('/api/auth/login', { userName, password });
        const { token, user } = response.data;
        setSession(token);
        dispatch({
            type: LOGIN,
            payload: {
                isLoggedIn: true,
                user
            }
        });
    };

    const register = async (userName, password, confirmPassword, departmentId) => {
        // todo: this flow need to be recode as it not verified
        const response = await axios.post('/api/Auth/register', {
            userName,
            password,
            confirmPassword,
            departmentId
        });

        const { token, user } = response.data;
        setSession(token);
        dispatch({
            type: LOGIN,
            payload: {
                isLoggedIn: true,
                user
            }
        });

        // let users = response.data;

        // if (window.localStorage.getItem('users') !== undefined && window.localStorage.getItem('users') !== null) {
        //     const localUsers = window.localStorage.getItem('users');
        //     users = [
        //         ...JSON.parse(localUsers),
        //         {
        //             userName,
        //             departmentId
        //         }
        //     ];
        // }

        // window.localStorage.setItem('users', JSON.stringify(users));
    };

    const logout = () => {
        setSession(null);
        dispatch({ type: LOGOUT });
    };

    const resetPassword = (userName) => console.log(userName);

    const updateProfile = () => {};

    if (state.isInitialized !== undefined && !state.isInitialized) {
        return <Loader />;
    }

    return (
        <JWTContext.Provider value={{ ...state, login, logout, register, resetPassword, updateProfile }}>{children}</JWTContext.Provider>
    );
};

JWTProvider.propTypes = {
    children: PropTypes.node
};

export default JWTContext;
