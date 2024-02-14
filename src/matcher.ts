import { Record as PostRecord } from './lexicon/types/app/bsky/feed/post'

/**
 * For well-known authors and domains,
 * match anything closely related to next or js
 */
const laxNextRegExp = /\bnext\b|\breact\b|\brsc\b|app?(\ )router|ssr|ssg|ppr|js/i
const nextWellKnownAuthors = [
    "leerob.bsky.social",
    "danabra.mov",
]
const nextWellKnownDomains = [
    "vercel.com"
]
const nextWellKnownDomainsRegExp = new RegExp(
    nextWellKnownDomains
        .map(d => d.replaceAll(".", "\\."))
        .join("|"))
export function isNextjsRelated(record: PostRecord, author: string) {
    const text = record.text
    if (nextWellKnownAuthors.includes(author) || author.match(nextWellKnownDomainsRegExp)) {
        return text.match(laxNextRegExp)
    }
    return (
        text.match(
            /\bnext\.js\b|\bnextjs\b/i
        ) ||
        // Too much noise at the moment
        // we need to check if the post is related to programming
        // text.match(/\s\bNext\b/) ||
        // other relevant concepts probably related to next
        text.match(/react server comp|app router|page router/)
    )
}

const laxReactRegExp = /react|js|javascript/
const reactWellKnownAuthors = [
    "leerob.bsky.social",
    "danabra.mov",
]
const reactWellKnownDomains = [
    "vercel.com"
]
const reactWellKnownDomainsRegExp = new RegExp(
    reactWellKnownDomains
        .map(d => d.replaceAll(".", "\\."))
        .join("|"))
export function isReactjsRelated(record: PostRecord, author: string) {
    const text = record.text
    if (reactWellKnownAuthors.includes(author) || author.match(reactWellKnownDomainsRegExp)) {
        return text.match(laxReactRegExp)
    }
    return (
        text.match(
            /\breact\.js\b|\breactjs\b/i
        ) ||
        // Too much noise at the moment
        // we need to check if the post is related to programming
        //text.match(/\s\bReact\b/) ||
        // various frameworks
        text.match(/\bnext?(\.)js|\bgatsby(?\.)js\b|\bastro?(\.)js\b|\bvite(?\.)js\b|\bremix(?.)js\b/)
    )
}