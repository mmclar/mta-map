import dataclasses
import datetime
import json
from typing import Any


class JSONEncoder(json.JSONEncoder):
    def default(self, o: Any) -> Any:
        if dataclasses.is_dataclass(o):
            return dataclasses.asdict(o)
        if type(o) == datetime.datetime:
            return o.isoformat()
        return super().default(o)


def second_of_day(time: datetime.time):
    return time.hour * 60 * 60 + time.minute * 60 + time.second


def pct(a, b, between):
    total = (second_of_day(b) - second_of_day(a))
    through = (second_of_day(b) - second_of_day(between))
    return through / total
