import React, { useState, useEffect } from 'react';
import { Amplify, Auth, Hub, DataStore } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import './login.scss'

const LoginComponent = (props) => {
    // track if user has loggedin 
    const [userInfoObj, setUserInfoObj] = useState({ isLoggedIn: false, data: null });

    // switch tabs
    const [tabPointer, setTabPointer] = useState(0);

    // login details
    const [loginUserName, setLoginUserName] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // create acc details
    const [createAccUserName, setCreateAccUserName] = useState("");
    const [createAccPassword, setCreateAccPassword] = useState("");
    const [createAccConPassword, setCreateAccConPassword] = useState("");
    const [createAccEmail, setCreateAccEmail] = useState("");
    const [confirmSignupCode, setConfirmSignupCode] = useState("");

    const [user, setUser] = useState(null);

    async function getAuthenticatedUser() {
        try {
            const user = await Auth.currentAuthenticatedUser()
            return user;
        } catch (e) {
            console.log("unable to fetch authenticated user");
        }
    }

    // hooks
    useEffect(() => {
        Hub.listen('auth', async ({ payload: { event, data } }) => {
            switch (event) {
                case 'signIn':
                    console.log("successfully signed in");
                    const user = await getAuthenticatedUser();
                    console.log("user", user);
                    setUserInfoObj({
                        isLoggedIn: true,
                        data: user
                    });
                    break;

                case 'cognitoHostedUI':
                    getUser().then(userData => setUser(userData));
                    break;
                case 'signOut':
                    DataStore.clear();
                    console.log("signed out");
                    setUser(null);
                    break;
                case 'signIn_failure':
                case 'cognitoHostedUI_failure':
                    console.log('Sign in failure', data);
                    break;
            }
        });
        getUser().then(userData => setUser(userData));
    }, []);

    function getUser() {
        return Auth.currentAuthenticatedUser()
            .then(userData => userData)
            .catch(() => console.log('Not signed in'));
    }

    async function signUp() {
        try {
            if (!confirmSignupCode) { // create acc details
                const { user } = await Auth.signUp({
                    username: createAccUserName,
                    password: createAccPassword,
                    attributes: {
                        email: createAccEmail,
                    }
                });

                setConfirmSignupCode(" ");
                setUserInfoObj({
                    isLoggedIn: false,
                    data: user
                });

                // reset fields
                setCreateAccUserName("");
                setCreateAccPassword("");
                setCreateAccConPassword("");
                setCreateAccEmail("");

            } else { // create acc verify user
                await Auth.confirmSignUp(userInfoObj.data.username, confirmSignupCode.trim());
                setUserInfoObj({
                    isLoggedIn: true,
                    data: userInfoObj.data
                });

                // reset fields
                setConfirmSignupCode("");
            }

        } catch (error) {
            console.log('error signing up:', error);
            alert('error signing up: ' + error)
        }
    }

    async function signIn() {
        try {
            const user = await Auth.signIn(loginUserName, loginPassword);
            setUserInfoObj({
                isLoggedIn: true,
                data: user
            });
            setLoginUserName("");
            setLoginPassword("");
        } catch (error) {
            console.log('error signing in', error);
            alert('error signing up: ' + error)
            setUserInfoObj({
                isLoggedIn: false,
                data: {}
            });
        }
    }

    async function signInWithGoogle() {
        try {
            const response = await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google });
            console.log("response", response);
            setUserInfoObj({
                ...userInfoObj,
                isLoggedIn: false,
            });

        } catch (error) {
            console.log('error signing in with google', error);
        }
    }

    async function signOut() {
        try {
            await Auth.signOut();
            setUserInfoObj({
                isLoggedIn: false,
                data: {}
            });
            DataStore.clear();
        } catch (error) {
            console.log('error signing out: ', error);
        }
    }

    function renderSignIn() {
        return (
            <div className='login-body'>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    signIn();
                }}>
                    <input required type="text" placeholder="User Name" value={loginUserName}
                        className="form-input" onChange={(e) => setLoginUserName(e.target.value)} />

                    <input required type="password" placeholder="Password" value={loginPassword}
                        className="form-input" onChange={(e) => setLoginPassword(e.target.value)} />

                    <input className="submit-btn" type="submit" value={'Sign In'} />
                </form>

                <input type="image" src="/assets/google-login.png" alt="" className="google-signin"
                    onClick={(e) => {
                        console.log("triggered here");
                        e.preventDefault();
                        signInWithGoogle();
                    }} />
            </div>

        );
    }

    function renderCreateAcc() {
        return (
            <form className='login-body' onSubmit={(e) => {
                e.preventDefault();
                signUp();
            }}>
                {!confirmSignupCode ?
                    <div>
                        <input required type="text" placeholder="Username" value={createAccUserName}
                            className="form-input" onChange={(e) => setCreateAccUserName(e.target.value)} />

                        <input required type="password" placeholder="Password" value={createAccPassword}
                            className="form-input" onChange={(e) => setCreateAccPassword(e.target.value)} />

                        <input required type="password" placeholder="Confirm Password" value={createAccConPassword}
                            className="form-input" onChange={(e) => setCreateAccConPassword(e.target.value)} />

                        <input required type="email" placeholder="Email" value={createAccEmail}
                            className="form-input" onChange={(e) => setCreateAccEmail(e.target.value)} />

                    </div>
                    :
                    <div className='confirm-user-container'>
                        <div className='confirm-text'>
                            To log in, enter the code we emailed you. It may take a minute to arrive.
                        </div>
                        <input required type="text" placeholder="Enter code" value={confirmSignupCode}
                            className="form-input" onChange={(e) => setConfirmSignupCode(e.target.value)} />
                    </div>
                }

                <input className="submit-btn" type="submit" value={'Create Account'} />

            </form>
        );
    }

    if (userInfoObj.isLoggedIn) { // user logged in, render main comp 
        return (
            <div>
                {React.cloneElement(props.children, { userInfoObj, signOut })}
            </div>
        );
    } else { // user not logged in, render login page
        return (
            <div className='login-component'>
                <div className='left-pane'>

                    <div className='login-container'>
                        <div className="login-header">
                            <div className={"tab-item " + (tabPointer === 0 && "tab-selected")}
                                onClick={() => { setTabPointer(0) }}>
                                Sign In
                            </div>
                            <div className={"tab-item " + (tabPointer === 1 && "tab-selected")}
                                onClick={() => { setTabPointer(1) }}>
                                Create Account
                            </div>
                        </div>

                        <div className='login-body-wrapper'>
                            {tabPointer === 0 ? renderSignIn() : renderCreateAcc()}
                        </div>
                    </div>
                </div>

                <div className='right-pane'>
                    <img src="/assets/amplify-wallpaper.jpg" alt="" />
                </div>
            </div>
        );
    }
}

export default LoginComponent;
