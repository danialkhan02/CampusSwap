class Error(Exception):
    _default_message = ""

    def __init__(self, msg="", *args, **kwargs):
        if not msg:
            msg = self._default_message
        super().__init__(msg, *args, **kwargs)
