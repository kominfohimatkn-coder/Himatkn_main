from datetime import date

from pydantic import BaseModel, Field, model_validator


def _validate_period_dates(
    start_date: date | None,
    end_date: date | None,
) -> None:
    if (
        start_date is not None
        and end_date is not None
        and end_date < start_date
    ):
        raise ValueError(
            "Tanggal selesai tidak boleh sebelum tanggal mulai"
        )


class PeriodIn(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    start_date: date | None = None
    end_date: date | None = None
    is_active: bool = False

    @model_validator(mode="after")
    def validate_dates(self):
        _validate_period_dates(self.start_date, self.end_date)
        return self


class PeriodUpdateIn(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    start_date: date | None = None
    end_date: date | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        _validate_period_dates(self.start_date, self.end_date)
        return self


class DivisionIn(BaseModel):
    period_id: int
    name: str = Field(min_length=2, max_length=100)
    description: str | None = None
    sort_order: int = 0


class PositionIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str | None = None
    sort_order: int = 0


class MemberIn(BaseModel):
    period_id: int
    division_id: int | None = None
    position_id: int
    name: str = Field(min_length=2, max_length=150)
    photo_url: str | None = None
    sort_order: int = 0
