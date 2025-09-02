import axios from 'axios'
import { streamInfo, userInfo } from '../data/twitch.js'

type accessTokenObj = {
    access_token: string,
    expires_in: number,
    token_type: string
}

/**
 * Generates a twitch access token. Access tokens expire in 2 months from date of creation.
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
const twitchConfig = {
    headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID!,
        'Authorization': `Bearer ${twitchCredentials.access_token}`
    }
}

/**
 * Gets info about a Twitch User's channel
 * 
 * Documentation: 
 * - https://dev.twitch.tv/docs/api/reference#get-users
 * @param username 
 */
export async function getTwitchUserInfo(username: string): Promise<userInfo>{
    const { data: { data: [userInfo] } } = await axios.get<{ data: userInfo[] }>(
        `https://api.twitch.tv/helix/users?login=${username}`,
        twitchConfig
    )
    return userInfo
}

/**
 * Gets info about a Twitch User's stream.
 * 
 * Documentation: 
 * - https://dev.twitch.tv/docs/api/reference#get-streams
 * @param username 
 * @return Stream info object. If stream is not live, returns undefined.
 */
export async function getTwitchStreamInfo(username: string): Promise<streamInfo | undefined>{
    const { data: { data: [streamInfo] } } = await axios.get<{ data: streamInfo[] }>(
        `https://api.twitch.tv/helix/streams?user_login=${username}`,
        twitchConfig
    )
    return streamInfo
}