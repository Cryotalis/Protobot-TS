import axios from 'axios'
import { EmbedBuilder } from 'discord.js'
import { schedule } from 'node-cron'
import { parse } from 'node-html-parser'
import { database } from '../database/index.js'
import { CHANNEL_IDS } from '../data/index.js'
import { sendToChannel } from '../utils/discord.js'
import { capFirstLetter } from '../utils/string.js'

// DD2 Wiki Changes
schedule('* * * * *', async () => {
	interface wikiChange {title: string, user: string, comment: string, timestamp: string, type: string, logaction: string, logtype: string, rcid: number, revid: number, logparams: {target_title: string, img_sha1: string}}
	function getAction(change: wikiChange){
		let action = ''
		
		if (change.type === 'log'){
			switch(change.logaction){
				case 'overwrite': 	action = 'Overwrote'; break
				case 'rights': 		action = 'Changed User Rights for'; break
				default: 			action = change.logaction.replace(/e$/, '') + 'ed'
			}
		} else {
			action = change.type === 'edit' ? 'Edited' : 'Created'
		}

		action += ` "${change.title}"`

		if (change.logaction === 'move') action += ` to "${change.logparams.target_title}"`
		if (change.logtype === 'newusers') action = 'Created an Account'

		return capFirstLetter(action)
	}

	const response = await axios.get('https://wiki.dungeondefenders2.com/api.php?action=query&list=recentchanges&rcprop=user|title|timestamp|comment|loginfo|ids&rclimit=5&format=json')
    const {data: {query: {recentchanges}}} = response
	const recentChangeIDsInfo = database.variables.find(v => v.get('name') === 'recentChangeIDs')!
	const recentChangeIDs = JSON.parse(recentChangeIDsInfo.get('value') || '[]')
	const changes: wikiChange[] = recentchanges.reverse()

	for (const change of changes){
		if (recentChangeIDs.includes(change.rcid)) continue
		recentChangeIDs.push(change.rcid)
		const url = `https://wiki.dungeondefenders2.com/index.php?title=${change.title}&diff=${change.revid}`.replace(/\s/g, '_')
		const wikiChangeEmbed = new EmbedBuilder()
			.setAuthor({name: change.user, url: `https://wiki.dungeondefenders2.com/wiki/User:${change.user.replace(/\s/g, '_')}`})
			.setTitle(`${change.user} ${getAction(change)}`)
			.setURL(`https://wiki.dungeondefenders2.com/wiki/${change.title.replace(/\s/g, '_')}`)
			.addFields({name: 'Comment', value: change.comment || 'No Comment Provided'})
			.setColor('Blue')
			.setTimestamp(Date.parse(change.timestamp))

		if (change.type === 'edit'){
			const document = parse((await axios.get(url)).data)
			const removed = document.querySelectorAll('.diff-deletedline').map(e => `- ${e.textContent}`).join('\n')
			const added = document.querySelectorAll('.diff-addedline').map(e => `+ ${e.textContent}`).join('\n')
			if (removed) wikiChangeEmbed.addFields({name: 'Removed', value: '```diff\n' + (removed.length > 950 ? `${removed.substring(0, 950)}\n- and more...` : removed) + '```'})
			if (added) wikiChangeEmbed.addFields({name: 'Added', value: '```diff\n' + (added.length > 950 ? `${added.substring(0, 950)}\n+ and more...` : added) + '```'})
		} else if (change.logparams?.img_sha1){
			const document = parse((await axios.get(url)).data)
			const imgURL = document.querySelector('img')!.getAttribute('src')!
			if (!/poweredby_mediawiki/.test(imgURL)) wikiChangeEmbed.setImage(`https://wiki.dungeondefenders2.com${imgURL}`)
		}

		sendToChannel(CHANNEL_IDS.WIKI_CHANGES, { embeds: [wikiChangeEmbed] })
	}
	if (recentChangeIDsInfo.get('value') === JSON.stringify(recentChangeIDs.slice(-10))) return
	recentChangeIDsInfo.set('value', JSON.stringify(recentChangeIDs.slice(-10))) // Store the recent change IDs to prevent duplicates
	await recentChangeIDsInfo.save()
})