from deep_translator import GoogleTranslator


def translate_text(text, source_lang='en', target_lang='fi'):
    """
    Translate text using deep-translator (Google Translate).
    Returns empty string on any error — never crashes the save().
    """
    try:
        if not text or not str(text).strip():
            return ''
        return GoogleTranslator(
            source=source_lang,
            target=target_lang
        ).translate(str(text))
    except Exception:
        return ''
