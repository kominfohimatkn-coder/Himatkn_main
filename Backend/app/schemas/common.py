from pydantic import BaseModel, Field
class PageMeta(BaseModel): offset:int; limit:int; total:int
class MessageResponse(BaseModel): message:str
