def db_cell_to_list(db_output):
    # Trims quotations and brackets from database output
    output = str(db_output)[2:-2]
    # Replace delimiting slashes in database output with empty strings
    output = output.replace("/", "").replace("\\", "")
    # Splits string by commas into list
    output = output.split(",")
    return output
