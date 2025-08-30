import axios from 'axios'

/**
 * Takes an Imgur link and returns a list of direct image links. Works with Albums and Galleries.
 * @param url An Imgur link
 * @returns Array of direct image links
 */
export async function getDirectImgurLinks(url: string): Promise<string[]> {
    if (url.includes('i.imgur.com') || !url.includes('imgur.com')) return [url]
    if (/(imgur\.)(com\/gallery\/|com\/a\/|com\/t\/.+?\/)/.test(url)) {
        const albumHash = url.match(/(?:com\/gallery\/|com\/a\/|com\/t\/.+?\/)(.+)/)![1]
        const {data: {data}} = await axios.get(`https://api.imgur.com/3/album/${albumHash}/images`, {headers: {Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`}})
        return data.map((img: any) => img.link) // TODO: Remove this any
    } else {
        const imageHash = url.match(/(?<=com\/).+/)
        const {data: {data}} = await axios.get(`https://api.imgur.com/3/image/${imageHash}`, {headers: {Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`}})
        return [data.link]
    }
}