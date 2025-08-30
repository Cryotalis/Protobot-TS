import axios from 'axios'
import { streamInfo, userInfo } from '../data/twitch.js'

interface accessTokenObj {access_token: string, expires_in: number, token_type: string}
/**
 * Generates a twitch access token. Access tokens expire in around 2 months from date of creation.
 * 
 * - Documentation: https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow
 * - Console: https://dev.twitch.tv/console
 */
async function getTwitchAccessToken(clientID: string, clientSecret: string) {
    const { data } = await axios.post<accessTokenObj>(`https://id.twitch.tv/oauth2/token`, null, {
        params: {
            client_id: clientID,
            client_secret: clientSecret,
            grant_type: 'client_credentials'
        }
    })
    return data
}

const twitchCredentials = await getTwitchAccessToken(process.env.TWITCH_CLIENT_ID!, process.env.TWITCH_CLIENT_SECRET!)

/**
 * Gets info about a Twitch User's channel or stream
 * 
 * Documentation: 
 * - https://dev.twitch.tv/docs/api/reference#get-users
 * - https://dev.twitch.tv/docs/api/reference#get-streams
 * @param username 
 * @param type 0 for channel info and 1 for stream info. Defaults to 0.
 * @return User info object or stream info object. If stream is not live, returns undefined.
 */
export async function getTwitchUserInfo(username: string, type = 0): Promise<userInfo | streamInfo | undefined>{
    const query = [`users?login=${username}`, `streams?user_login=${username}`][type]
    const {data: {data: [info]}} = await axios.get(`https://api.twitch.tv/helix/${query}`, {
        headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID!,
            'Authorization': `Bearer ${twitchCredentials.access_token}`
        }
    })
    return info
}