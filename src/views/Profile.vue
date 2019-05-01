<template>
    <section class="profile option-container mt-3">
        <h2>{{$t("profile.title")}}</h2>
        <div class="option-group">
            <h3 class="header">{{$t("profile.encryption")}}</h3>
            <SettingSection
                id="profile-encryption-renew-secret-group"
                :label="$t('profile.renewSecret')"
            >
                <template v-if="!security.success">
                    <b-input-group v-if="!security.renew">
                        <b-input
                            id="profile-encryption-renew-current-secret"
                            :class="validClass"
                            type="password"
                            placeholder="Your current secret"
                            :state="security.valid"
                            :disabled="!encryptionEnabled"
                            v-model="security.currentSecret"
                        />
                        <b-input-group-append>
                            <b-button variant="warning" @click="validateSecret">Renew</b-button>
                        </b-input-group-append>
                    </b-input-group>
                    <template v-else>
                        <b-input
                            id="profile-encryption-renew-new-secret"
                            type="password"
                            class="my-1"
                            :class="validClass"
                            placeholder="Your new secret"
                            :disabled="!encryptionEnabled"
                            :state="security.valid"
                            v-model="security.newSecret"
                        />

                        <b-input-group class="mt-1">
                            <b-input
                                id="profile-encryption-renew-new-secret-confirm"
                                type="password"
                                :class="validClass"
                                placeholder="Confirm your new secret"
                                :disabled="!encryptionEnabled"
                                :state="security.valid"
                                v-model="security.newSecretConfirm"
                            />
                            <b-input-group-append>
                                <b-button variant="danger" @click="renewSecret">
                                    <template v-if="security.busy">
                                        <b-spinner></b-spinner>
                                    </template>
                                    <template v-else>Renew</template>
                                </b-button>
                                <b-button variant="secondary" @click="abortSecretRenewal">Cancel</b-button>
                            </b-input-group-append>
                        </b-input-group>
                    </template>
                </template>
                <template v-else>
                    <b-input
                        class="text-center"
                        value="Successfully renewed secret"
                        :plaintext="true"
                    ></b-input>
                </template>
            </SettingSection>
        </div>
        <div class="option-group"></div>
    </section>
</template>

<script>
import SettingSection from "@/components/SettingSection/SettingSection";

export default {
    name: "profile",
    components: {
        SettingSection
    },
    data() {
        return {
            security: {
                renew: false,
                currentSecret: null,
                newSecret: null,
                newSecretConfirm: null,
                busy: false,
                success: false,
                valid: null
            },
            defaultSecurity: {
                renew: false,
                currentSecret: null,
                newSecret: null,
                newSecretConfirm: null,
                busy: false,
                success: false,
                valid: null
            }
        };
    },
    computed: {
        encryptionEnabled() {
            const security = this.$store.getters.getSecurity;
            return security.secret !== null;
        },
        validClass() {
            return this.security.valid !== true && this.security.valid !== null
                ? "shake"
                : "";
        }
    },
    created() {
        // this.getSecurity();
    },
    methods: {
        getSecurity() {
            this.security = this.$store.getters.getSecurity;
        },
        async validateSecret() {
            this.security.valid = null;
            const response = await this.$store.dispatch(
                "authentificate",
                this.security.currentSecret
            );
            this.security.valid = response === true ? null : false;
            this.security.renew = response;
        },
        async renewSecret() {
            this.security.valid = null;
            if (this.security.newSecret === this.security.newSecretConfirm) {
                try {
                    this.security.valid = true;
                    this.security.busy = true;
                    await this.$store.dispatch("renewAuthentification", {
                        oldSecret: this.security.currentSecret,
                        newSecret: this.security.newSecret
                    });
                    this.security.busy = false;
                    this.security.success = true;
                } catch (error) {
                    console.log(error.message);
                }
            } else {
                this.security.valid = false;
            }
        },
        abortSecretRenewal() {
            Object.assign(this.security, this.defaultSecurity);
        }
    }
};
</script>