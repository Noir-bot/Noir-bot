import Emojis from "./Emojis"

export default class Preferences {
  public static readonly premiumEmoji = Emojis.premium || '⭐'
  public static readonly removeValue = '{{remove}}'
  public static readonly embedFieldsLimit = 25
  public static readonly reasonLimit = 500
}