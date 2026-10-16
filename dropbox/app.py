from flask import Flask, render_template, request, send_file, redirect
import dropbox
import io
import os

app = Flask(__name__, template_folder=".")

TOKEN = "sl.u.AGyscDtVag8DjlyC0yCuZtC1UFSPjE1_cfmsQg9GRU2bG8XksniJk63L280axhU0GrBD7puOwWBUsOwPYnrwt8XQbAp4qkEO07uY7P-sJgkXj_0aPUBhjTyk0_pqURPfVDFTAOF_DwH_C11JyVNbjj9SM961hUSFMHtpvbcuAD-iFpEmeJF_gFaP8H1qGuNErb2UvymIQopCQNtezvs59z3ehbXSpAz4FWi3HjEH-_ZkVo0_qJOCm37_0GEXWI2p3yjEax2jBGO_6YoIV16gT5ww2sn2RiFTc52hCwSKTgBks2H9OhDHcF4VapmOleoMMrBpBUwYcrqcrhzlX2gRp1oyxIt15FP3Z8GA9ZfQl3xIivbuKA8hkpC63IHFitM1ivjmEe0XajR4NX-6CafM2WQmfKouiCcuY5zU4FzaE4NA-p80-UCPuLf2j642evgyMqa6mS3oTGnXWNHRiDneMN3KEvS5koGE6LdNfkYWcxoocbaoVpg6vIwq2614M3wjo7d6cKoc1tOZvFdXpLmkT03Fb4FkeaBkqZXGGK-7J0T0l96HiOK8_UkiPG6Ak9ThGtKGJK3ONlvNC7DJA3l_oPP3WKYCiTi8vasbIBFH3nZDiKqYEHEvcc9SrLCrjv2idv4HAMpA2SEcy2zo1J7MeGpHpFgw5NPdP1pOVgQvHogNFNF4B0ODAHiJPBIsa-LcL027uIi7kdPn2WoB8q4vtkqzwv_yDupHp179ZL5e0wEOIZ7DVkrA3kcD_Z2haONCimWBtwIoYW_s_ifqHNWiivaoJjznF7v1KBbawzbgb3omdebDUrFVme8BjVvkoY_XtwfXzrR3eTIhSAf08-0lRhgh8Fz_M_6haWFuKa_lXRA5jpmERuux7d_u-nVnyW5AbsbLW_D4wgRJ7K2LASvFhlVeskmF-2lczu2MvWPaCmpq79kduKWfTWM9ahdvSgRH8QqZXXcDaz0uYtUQc4ImdX6s1Qdg_BTeKlrMm1fI_u-2-t9ld9JejPKJuDF4huyYVpbzI5BRwzPDsycmX7_zYhFfI5V0PWR4W1iaTm_gAvWO6ZJNFSJ4CrLgnSu8CgHVqVLVbWyBJvbv_pESX57iJsGE4Qe6fhJeL_PWGJsVsT_WFMGuQTeQWpXMWVwKIOg8ihtYX7Dd1klxlbgg_4fLeNORUe0kGdlOgPrOjpNdT8GMaBi6zfVhYY-vq98mULE7l7LTmYyEiyzglsf5x65qEOwt0RHublNmFrmEUoKfzjidld3HAT0PMM_76CTQA1qH6nyCMOik0MQ3E5lgh0AFZZ1vnBPsuWwST-IT8EGHMuL1FI0XUQ5f9BLSllgmc0rVwP6LBlijrwwZVp2WfmeHTrEfmEntZGr9-FYd6gP6LhdvJgq-e5ZwvkhmRUu5j9H8W23SvQRwpolBZLCAFh5zLs2hOLZYgrNfBQwsS-rshLTtCw"
db = dropbox.Dropbox(TOKEN)

@app.route("/")
def home():
    files = db.files_list_folder("").entries
    files = [f for f in files if isinstance(f, dropbox.files.FileMetadata)]
    return render_template("index.html", files=files)

@app.route("/upload", methods=["POST"])
def upload():
    f = request.files["file"]
    if f.filename:
        db.files_upload(f.read(), "/" + f.filename,
                        mode=dropbox.files.WriteMode.overwrite)
    return redirect("/")

@app.route("/download/<path:name>")
def download(name):
    metadata, response = db.files_download("/" + name)
    return send_file(
        io.BytesIO(response.content),
        as_attachment=True,
        download_name=os.path.basename(name)
    )

if __name__ == "__main__":
    app.run(debug=True)
