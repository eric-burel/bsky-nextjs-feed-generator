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
        // too many false positive when at the beginning of a sentence
        text.match(/\s\bNext\b/) ||
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
        // match only "React" to avoind ambiguity with the verb
        // might be improved by checking if the context is related to web programming
        // too many false positive when at the beginning of a sentence
        text.match(/\s\bReact\b/) ||
        // various frameworks
        text.match(/\bnext|\bgatsby|\bastro|\bvite|\bremix/)
    )
}