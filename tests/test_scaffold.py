import pytest

from pipeline import scaffold


def test_slugify_lowercases_and_hyphenates_spaces():
    assert scaffold.slugify("Blue Square") == "blue-square"


def test_slugify_collapses_whitespace_and_underscores():
    assert scaffold.slugify("  Multiple   Spaces ") == "multiple-spaces"
    assert scaffold.slugify("under_score") == "under-score"


def test_slugify_strips_unsafe_chars():
    assert scaffold.slugify("A/B & C 2025") == "a-b-c-2025"


def test_slugify_empty_after_cleaning_raises():
    with pytest.raises(ValueError):
        scaffold.slugify("רבוע כחול")  # non-ascii → no safe chars left
