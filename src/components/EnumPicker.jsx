import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

export default function EnumPicker(props) {
    return (
        <TextField select label={props.label} value={props.value} onChange={(event) => props.onChange(event.target.value)} sx={props.sx}>
            {Object.enum(props.enum).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    );
}