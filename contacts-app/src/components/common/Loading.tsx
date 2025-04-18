import React from 'react';
import Backdrop from "@mui/material/Backdrop"
import CircularProgress from "@mui/material/CircularProgress"

const Loading : React.FC<{ loading: boolean }> = ({ loading }) => {
    return (
        <Backdrop
            sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
            open={loading}
            >
            <CircularProgress color="inherit" />
        </Backdrop>
    )
}

export default Loading;