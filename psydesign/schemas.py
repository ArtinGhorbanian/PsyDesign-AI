"""Strict request, response, and provider-boundary schemas."""

from __future__ import annotations

import re
from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator

Language = Literal["en", "es", "fr", "hi", "zh", "ar"]
Mode = Literal["demo", "openai"]
ShortText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=160)]
MediumText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=800)]
LongText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2400)]

_DISALLOWED_CONTROLS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, str_strip_whitespace=True)


class FontChoice(StrictModel):
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]
    style: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=40)]


class FontPairing(StrictModel):
    heading: FontChoice
    body: FontChoice


class VisualIdentity(StrictModel):
    font_pairing: FontPairing


class BrandPersonality(StrictModel):
    archetype: ShortText
    tone_of_voice: MediumText
    values: list[ShortText] = Field(min_length=2, max_length=8)


class TargetAudiencePersona(StrictModel):
    name: ShortText
    age_range: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=60)]
    occupation: ShortText
    interests: list[ShortText] = Field(min_length=1, max_length=8)
    pain_points: list[MediumText] = Field(min_length=1, max_length=8)


class MarketingCampaignIdea(StrictModel):
    title: ShortText
    concept: LongText


class BrandReport(StrictModel):
    """The complete, nested analysis contract shared by every provider."""

    brand_personality: BrandPersonality
    visual_identity: VisualIdentity
    brand_names: list[ShortText] = Field(min_length=1, max_length=8)
    slogans: list[MediumText] = Field(min_length=1, max_length=8)
    brand_story: LongText
    social_media_bio: MediumText
    target_audience_persona: TargetAudiencePersona
    marketing_campaign_idea: MarketingCampaignIdea
    logo_concept_description: LongText


def _validate_user_text(value: str) -> str:
    cleaned = value.strip()
    if _DISALLOWED_CONTROLS.search(cleaned):
        raise ValueError("text contains unsupported control characters")
    return cleaned


class BrandRequest(StrictModel):
    description: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=12, max_length=1200)
    ]
    language: Language = "en"

    _clean_description = field_validator("description")(_validate_user_text)


class ChatRequest(StrictModel):
    analysis: BrandReport
    message: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=1200)]
    language: Language = "en"

    _clean_message = field_validator("message")(_validate_user_text)


class TTSRequest(StrictModel):
    text: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=3000)]

    _clean_text = field_validator("text")(_validate_user_text)


class GenerateBrandResponse(StrictModel):
    id: int
    analysis: BrandReport
    logo_url: str
    mode: Mode


class HistoryItemResponse(StrictModel):
    id: int
    description: str
    analysis: BrandReport
    logo_url: str
    language: Language
    created_at: datetime
    mode: Mode


class ChatResponse(StrictModel):
    reply: str
    mode: Mode


class DeleteResponse(StrictModel):
    message: str


class StatusResponse(StrictModel):
    status: Literal["ready"]
    mode: Mode
    persistence: Literal["session-scoped"] = "session-scoped"


class HealthResponse(StrictModel):
    status: Literal["ok"]
