import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';

import Add from "@material-ui/icons/AddToHomeScreen";
import { useTranslate, getT } from '../translation/GPi18n';

const PWA = {
    deferredPrompt: null,

    checkIfNotPWA(withoutLocal = false) {
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true || !!window.cordova || (!withoutLocal && localStorage.getItem('pwagp') === ("deny" || "installed")
        )) return false;
        else return true;
    },
    promptInstallation(onClose) {
        const t = getT()
        if (!PWA.deferredPrompt) return alert(t("allready_installed"))
        PWA.deferredPrompt.prompt();
        PWA.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                onClose(true);
            }
        });
    },

    listeners() {
        window.addEventListener('appinstalled', e => localStorage.setItem('pwagp', 'installed'));
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            PWA.deferredPrompt = e;
        });
    }

}

const AddToHomeScreen = (props) => {
    const { t } = useTranslate();
    const onClose = () => {
        localStorage.setItem('pwagp', 'deny');
        props.setOpen(false);
    }
    const IOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

    const IOSFUNC = () => {
        if (isSafari) {
            return <span>
                {t("more_options.add_pwa.saf1")}
                {" "}<img width="20" height="25" src="/images/iphone-pwa.png" />{" "},{" "}
                {t("more_options.add_pwa.saf2")}
            </span>;
        } else if (isChrome) {
            return <span>
                {t("more_options.add_pwa.chrome1")}
                {" "}<img width="20" height="25" src="/images/iphone-pwa.png" />{" "},
                {t("more_options.add_pwa.chrome2")}
            </span>
        }
    }
    return (
        <Dialog style={{ zIndex: 9999 }}
            open={props.open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle className="text-center" id="alert-dialog-title">{t("more_options.add_pwa.title")}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description" className="text-center">
                    <span>
                        {t("more_options.add_pwa.text")}
                    </span>
                    <br /><br />
                    {IOS && IOSFUNC()}
                </DialogContentText>
                <div className="d-flex justify-content-center mt-2">
                    <img height="64" src="/images/logo.ico" />
                </div>
                <br />
            </DialogContent>
            <DialogActions className="d-flex justify-content-center">
                <Button color="primary" onClick={onClose} children={IOS ? t("close") : t("cancel")} />
                {!IOS && <Button onClick={() => PWA.promptInstallation(onClose)} variant="contained"
                    color="primary" autoFocus style={{ color: "white", outline: "none" }}>
                    {t("more_options.add_pwa.add")} <Add />
                </Button>}
            </DialogActions>
        </Dialog>
    );
}


export { PWA, AddToHomeScreen };
