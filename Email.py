import json

class Email:
    def __init__(self, preferences, links, decoded_content, indicator_of_first_time_sender, indicator_of_first_time_domain):
        self.preferences = preferences
        self.links = links
        self.decoded_content  =  decoded_content 
        self.indicator_of_first_time_sender = indicator_of_first_time_sender
        self.indicator_of_first_time_domain = indicator_of_first_time_domain 
        
    def to_json(self):
        return json.dumps(self.__dict__)

    @classmethod
    def from_json(cls, json_str):
        data = json.loads(json_str)
        return cls(**data)
    
    def __str__(self):
        return f"Sender Email: {self.sender_email}\nTime: {self.time}\nSubject: {self.subject}\nContent: {self.content}\nLinks: {self.links}\nDecoded Content: {self.decoded_content}\nCounter from Sender: {self.indicator_of_first_time_sender}\nCounter from Doamin: {self.indicator_of_first_time_domain}"
