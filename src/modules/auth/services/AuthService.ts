
import config from "../../../config";
import { DecodedTokenPayload, IChangePasswordInput, IForgotPasswordInput, ILoginInput, IResetPasswordInput, ISignUpInput } from "../interfaces/IAuth";
import UserService from "../../users/services/UserService";
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken'

import Logger from "../../../libs/logger";

import { eventEmitter } from "../../../libs/event";
import mongoose from "mongoose";
import AuthRepository from "../repositories/AuthRepository";
import {  UserType } from "../../../enum/User";
import CacheService from "../../../libs/cache";
import EncryptService from "../../../libs/encrypt/hash";
import { NotificationEvent } from "../../../enum/Notification";
import Auth from "../models/auth.model";
const TAG = "AUTHSERVICE";


export default class AuthService {

    public static async signup(input: ISignUpInput) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {

           

            const { password, email: initial } = input;
          const email = initial.trim().toLowerCase();




            const emailExists = await  UserService.getUserByEmail(email)
                
            
            
            if ( emailExists) {

                return {
                    error: "User with that email already exists"
                }
            };

            
          
   
            const hashedPassword = await bcrypt.hash(password, 10);
            const { data: newUser, error } = await UserService.createUser({
                email,
                firstName: input.firstName,
                lastName: input.lastName,
            }, session);

            if (error || !newUser) {
                return {
                    error: error || "An error occured while creating user"
                }
            }


            const authData = {
                username: newUser.email,
                password: hashedPassword,
                userId: newUser.id
            };

            const auth = await AuthRepository.createAuth(authData, session);



            const tokenPayload = { id: newUser.id, type: UserType.USER, };
            // const createdUser = await UserService.getUserById(newUser.id)

            const { token: accessToken, expiryAt } = this.generateToken(tokenPayload, '2d');
            const { token: refreshToken } = AuthService.generateToken(tokenPayload, '30d');
            const cacheKey = `auth:refreshToken:${refreshToken}`;

            // Cache the refresh token
            await CacheService.saveToCache(cacheKey, JSON.stringify({ accessToken, refreshToken }), 60 * 60 * 24 * 30); // Cache for 30 days

            await session.commitTransaction();

            this.sendVerificationCode(newUser.id, "email");

            return {
        
                data: { user: newUser, accessToken, refreshToken, tokenExpiryAt: expiryAt, }
            }

        } catch (error) {
            await session.abortTransaction();
            Logger.error(`${TAG}::${error}`);
            return {
                error: "An error occured while creating user"
            }

        } finally {
            session.endSession();
        }
    }

    public static async login(input: ILoginInput) {

        const { username, password } = input;




        const auth = await AuthRepository.findOne({     username: username.trim().toLowerCase()  });
        if (!auth) {
            return {
                error: "Invalid credentials"
            }
        }

        const passwordMatch = await EncryptService.comparePassword(password, auth.password);
        if (!passwordMatch) {
            return {
                error: "Invalid credentials"
            }
        }

        const user = await UserService.getUserById(auth.userId);
        if (!user) {
            return {
                error: "User not found"
            }
        }



        user.lastLoginAt = new Date();
        await user.save();

        const tokenPayload = { id: user.id, type: user.type, }

        const { token: accessToken, expiryAt } = AuthService.generateToken(tokenPayload, '2d');
        const { token: refreshToken } = AuthService.generateToken(tokenPayload, '30d');
        const cacheKey = `auth:refreshToken:${refreshToken}`;

        // Cache the refresh token
        await CacheService.saveToCache(cacheKey, JSON.stringify({ accessToken, refreshToken }), 60 * 60 * 24 * 30); // Cache for 30 days

        return {
            data: {
                user,
                tokenExpiryAt: expiryAt,
                accessToken,
                refreshToken,
            }
        }

    };

    public static async refreshToken(token: string) {

        const cacheKey = `auth:refreshToken:${token}`;
        const cachedData = await CacheService.getFromCache(cacheKey);

        if (!cachedData) {
            return {
                error: "Invalid token"
            }
        }

        const { decoded, valid } = this.verifyToken(token)
            ;
        if (!valid || !decoded) {
            return {
                error: "Invalid token"
            }
        }


        const user = await UserService.getUserById(decoded.id);
        if (!user) {
            return {
                error: "User not found"
            }
        }

        const tokenPayload = { id: user.id, type: user.type, }

        const { token: accessToken, expiryAt } = AuthService.generateToken(tokenPayload, '2d');
        const { token: refreshToken } = AuthService.generateToken(tokenPayload, '30d');
        // Cache the new refresh token
        await CacheService.saveToCache(cacheKey, JSON.stringify({ accessToken, refreshToken }), 60 * 60 * 24 * 30); // Cache for 30 days

        return {
            data: {
                tokenExpiryAt: expiryAt,
                accessToken,
                refreshToken,
            }
        }
    }


    public static async sendVerificationCode(userId: string, type: "email" | 'phone') {

        const user = await UserService.getUserById(userId);
        if (!user) {
            return {
                error: "User not found"
            }
        }
 
        // send code to user
        return {
            data: {}
        }


    }

    private static generateCode() {
        //Generate random 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000);
        return code;
    }

    private static async generateUserVerificationCode(userId: string, type: "email" | "phone") {

        //Generate random 6 digit code
       
        const verificationCode =  this.generateCode();

        const cacheKey = `verification-code:${type}:${userId}`

        await CacheService.saveToCache(cacheKey, String(verificationCode), 60 * 60 * 10)
     
        // send code to user
        return verificationCode;


    }

    /**
     * generateToken
     */
    public static generateToken(payload: Record<string, string | string[]>, expiresIn: SignOptions['expiresIn']) {
        const token = jwt.sign(payload, config.env.jwtSecret, {
            expiresIn

        });

        const decoded = jwt.decode(token) as { exp?: number };

        return { token, expiryAt: decoded.exp };

    }

    public static verifyToken(token: string) {
        try {
            const payload = jwt.verify(token, config.env.jwtSecret) as DecodedTokenPayload;


            return {
                valid: true,
                expired: false,
                decoded: payload,
            };
        } catch (e: any) {
            /// console.error(e);
            return {
                valid: false,
                expired: e.message === "jwt expired",
                decoded: null,
            };
        }
    }


    public static async validateVerificationCode(userId: string, code: string, type: 'email' | 'phone') {
        const cacheKey = `verification-code:${type}:${userId}`

        const verificationCode = await CacheService.getFromCache(cacheKey)
        if (!verificationCode) {
            return {
                error: "Invalid code"
            }
        };
        const user = await UserService.getUserById(userId);
        if (!user) {
            return {
                error: "User not found"
            }
        };

        if( verificationCode !== String(code)) {
            return {
                error: "Invalid or expired code"
            }
        }

        await user.save();

      await CacheService.deleteFromCache(cacheKey);
        

        return {
            data: {}
        }
    }


    public static async forgotPassword(input: IForgotPasswordInput) {
        const email = input.email;
        const user = await UserService.getUserByEmail(email);
        if (!user) {
            Logger.error(`${TAG}::User not found for email ${email}`);
            return {
                data: {}
            }
        }

        const code = this.generateCode();

        const cacheKey = `password-reset-code:${user.id}`;
        CacheService.saveToCache(cacheKey, String(code))



        eventEmitter.emitEvent(NotificationEvent.SEND_PASSWORD_RESET_CODE, { user, resetCode: code })
     

        // send code to user
        return {
            data: {}
        }


    }

    public static async resetPassword(input: IResetPasswordInput) {

        try {

            const email = input.email;





            const auth = await AuthRepository.findOne({
                username: email.trim().toLowerCase()
            })


            if (!auth) {

                return {
                    error: "Invalid OTP",
                    statusCode: 400
                }
            };
            const cacheKey = `password-reset-code:${auth.userId}`;

            const savedCode = await CacheService.getFromCache(cacheKey);


            const user = await UserService.getUserById(auth.userId);
            if (!user) {

                return {
                    error: "Invalid OTP",
                    statusCode: 400
                }
            }

            if (!savedCode || savedCode !== String(input.code)) {
                return {
                    error: "Invalid OTP",
                    statusCode: 400
                }
            };

            const hashedPassword = await EncryptService.hashPassword(input.password);
                

        
            auth.password = hashedPassword;
            await auth.save();



            CacheService.deleteFromCache(cacheKey);


            return {
                data: {}
            }
        } catch (error) {
            Logger.error(`${TAG}::${error}`);
            return {
                error: "An error occured while resetting password"
            }

        }



    }



    public static async changePassword(id: string, input: IChangePasswordInput, force = false) {
        const auth = await AuthRepository.findOne({
            userId: id
        });


        
        if (!auth) {
            return {
                error: "User not found"
            }
        };

        const { password, oldPassword } = input;

        const passwordMatch = await EncryptService.comparePassword(oldPassword, auth.password);

        if (!force && !passwordMatch) {
            return {
                error: "Invalid old password"
            }
        }

        

        const hashedPassword = await EncryptService.hashPassword(password);
        auth.password = hashedPassword;
        await auth.save();

        return {
            data: {}
        }

    }
 public static async getAuthByUserId(userId: string) {
     const auth = await AuthRepository.findOne({ userId });
     
     return { data: auth }
    };

    public static async invalidateUserSessions(userId: string) {
    }

    public static async  deleteAuth(userId: string) {
        const auth = await AuthRepository.findOne({ userId });
        
        if (auth) {
            await AuthRepository.deleteOne({ userId });
        }

        return {
            data: {}
        }
    }

}
