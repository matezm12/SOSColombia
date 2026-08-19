"""
Self-check for discover.py's pure logic (no network, no DB) -- the JSON
unwrap helper, keyword/scoring functions, and city matching. Run directly:

    python scripts/social-discovery/test_discover.py

or via pytest if it's already installed: `pytest scripts/social-discovery/`.
"""

from discover import (
    Candidate,
    guess_category,
    guess_kind,
    match_municipio,
    normalize,
    score_candidate,
    suggest_new_targets,
    unwrap_json_response,
)


def test_unwrap_json_response():
    wrapped = '<html><head></head><body><p>{"a": 1, "b": [2, 3]}</p></body></html>'
    assert unwrap_json_response(wrapped) == {"a": 1, "b": [2, 3]}

    # Falls back to parsing the raw text directly when there's no <p> wrapper
    # (e.g. a plain JSON response with no browser-added shell).
    assert unwrap_json_response('{"x": true}') == {"x": True}


def test_normalize_strips_accents_and_lowercases():
    assert normalize("Pereira Risaralda") == "pereira risaralda"
    assert normalize("QUIBDÓ") == "quibdo"
    assert normalize("San José del Palmar") == "san jose del palmar"


def test_guess_category():
    assert guess_category("Necesitamos urgentemente pañales y agua") == "NEED"
    assert guess_category("Nuevo albergue habilitado en el coliseo") == "AID_POINT"
    assert guess_category("Gracias a todos por su apoyo estos días") == "HUMAN_INTEREST"


def test_guess_kind():
    assert guess_kind("Se abrió un albergue temporal en el barrio") == "ALBERGUE"
    assert guess_kind("Punto de acopio en la plaza principal") == "ACOPIO"
    assert guess_kind("Gracias por las donaciones") is None


def test_match_municipio():
    municipios = [("m1", "Pereira"), ("m2", "Armenia"), ("m3", "Quibdó")]
    assert match_municipio("Novedades en Pereira hoy", None, municipios) == ("m1", "Pereira")
    # Accent-insensitive against the caption text.
    assert match_municipio("Situacion en Quibdo", None, municipios) == ("m3", "Quibdó")
    # Falls back to the platform's own location tag when the caption doesn't mention a city.
    assert match_municipio("Gracias a todos", "Armenia, Quindío", municipios) == ("m2", "Armenia")
    assert match_municipio("Sin ciudad mencionada", None, municipios) is None


def test_score_candidate_keyword_and_context():
    # Strong signal: kind keyword + earthquake context + city match + known handle + corroborated.
    high = score_candidate(
        caption="Nuevo albergue en Pereira para los damnificados del terremoto",
        location_name=None,
        author_handle="globalshaperspereira",
        known_handles={"globalshaperspereira"},
        municipio_match=("m1", "Pereira"),
        corroborated=True,
    )
    assert high >= 8, f"expected a high score, got {high}"

    # No earthquake context at all -- should be penalized hard, likely below the floor.
    low = score_candidate(
        caption="Feliz cumpleaños a nuestro querido albergue de mascotas",
        location_name=None,
        author_handle="randomaccount",
        known_handles=set(),
        municipio_match=None,
        corroborated=False,
    )
    assert low < 4, f"expected a low score, got {low}"

    # Score is always clamped to [0, 10].
    assert 0 <= high <= 10
    assert 0 <= low <= 10


def test_score_candidate_known_handle_softens_context_penalty():
    # A real, legitimate post from a vetted TARGETS account can skip
    # restating "terremoto" (internal logistics language) -- the missing-
    # context penalty should be lighter than for an unknown account saying
    # the exact same thing.
    known_no_context = score_candidate(
        caption="Seguimos coordinando la logística de distribución con el equipo",
        location_name=None,
        author_handle="globalshaperspereira",
        known_handles={"globalshaperspereira"},
        municipio_match=None,
        corroborated=False,
    )
    unknown_no_context = score_candidate(
        caption="Seguimos coordinando la logística de distribución con el equipo",
        location_name=None,
        author_handle="randomaccount",
        known_handles={"globalshaperspereira"},
        municipio_match=None,
        corroborated=False,
    )
    assert known_no_context > unknown_no_context, (
        f"expected known-handle score ({known_no_context}) > unknown-handle score ({unknown_no_context})"
    )


def test_suggest_new_targets():
    to_stage = [
        # Known IG account -- not a suggestion.
        (
            Candidate(platform="INSTAGRAM", permalink="https://www.instagram.com/p/known/", author_handle="globalshaperspereira"),
            {"author_handle": "globalshaperspereira", "hashtags": []},
            8,
            None,
        ),
        # New IG account -- should be suggested.
        (
            Candidate(platform="INSTAGRAM", permalink="https://www.instagram.com/p/newacct/", author_handle="nuevaorg"),
            {"author_handle": "nuevaorg", "hashtags": []},
            6,
            None,
        ),
        # Same new IG account again -- should only be suggested once (deduped via set()).
        (
            Candidate(platform="INSTAGRAM", permalink="https://www.instagram.com/p/newacct2/", author_handle="nuevaorg"),
            {"author_handle": "nuevaorg", "hashtags": []},
            5,
            None,
        ),
        # New TikTok hashtag co-occurring on a staged video.
        (
            Candidate(platform="TIKTOK", permalink="https://www.tiktok.com/@x/video/1"),
            {"author_handle": "x", "hashtags": ["terremotocolombia", "sospereira"]},
            7,
            None,
        ),
    ]
    suggestions = suggest_new_targets(to_stage)
    assert suggestions["instagram_profiles"] == ["nuevaorg"], suggestions
    assert suggestions["x_profiles"] == [], suggestions
    assert suggestions["tiktok_hashtags"] == ["sospereira"], suggestions  # terremotocolombia already known


def main():
    tests = [v for k, v in globals().items() if k.startswith("test_") and callable(v)]
    failures = 0
    for test in tests:
        try:
            test()
            print(f"ok   {test.__name__}")
        except AssertionError as err:
            failures += 1
            print(f"FAIL {test.__name__}: {err}")
    print(f"\n{len(tests) - failures}/{len(tests)} passed")
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
