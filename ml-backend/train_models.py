"""
Train ML Models using NAAMII Colorimetric Analysis Dataset
Paper: "Colorimetric detection on paper analytical device using machine learning"
Authors: Bidur Khanal, Pravin Pokhrel, Bishesh Khanal, Basant Giri (NAAMII, 2021)
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data', 'mean_value_data')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

def load_and_merge_datasets(dataset_type='food'):
    """
    Loads and merges RGB, HSV, and LAB data into a single unified feature matrix
    with reference-subtracted illumination-invariant color differences.
    """
    if dataset_type == 'food':
        rgb_train_file = os.path.join(DATA_DIR, 'mean_pixel_RGB_2400.csv')
        hsv_train_file = os.path.join(DATA_DIR, 'mean_pixel_HSV_2400.csv')
        lab_train_file = os.path.join(DATA_DIR, 'mean_pixel_LAB_2400.csv')

        rgb_test_file = os.path.join(DATA_DIR, 'mean_pixel_RGB_600.csv')
        hsv_test_file = os.path.join(DATA_DIR, 'mean_pixel_HSV_600.csv')
        lab_test_file = os.path.join(DATA_DIR, 'mean_pixel_LAB_600.csv')
    else: # pesticide
        rgb_train_file = os.path.join(DATA_DIR, 'mean_pixel_RGB_pesticide_train.csv')
        hsv_train_file = os.path.join(DATA_DIR, 'mean_pixel_HSV_pesticide_train.csv')
        lab_train_file = os.path.join(DATA_DIR, 'mean_pixel_LAB_pesticide_train.csv')

        rgb_test_file = os.path.join(DATA_DIR, 'mean_pixel_RGB_pesticide_test.csv')
        hsv_test_file = os.path.join(DATA_DIR, 'mean_pixel_HSV_pesticide_test.csv')
        lab_test_file = os.path.join(DATA_DIR, 'mean_pixel_LAB_pesticide_test.csv')

    print(f"Loading {dataset_type} dataset...")
    df_rgb_tr = pd.read_csv(rgb_train_file)
    df_hsv_tr = pd.read_csv(hsv_train_file)
    df_lab_tr = pd.read_csv(lab_train_file)

    df_rgb_te = pd.read_csv(rgb_test_file)
    df_hsv_te = pd.read_csv(hsv_test_file)
    df_lab_te = pd.read_csv(lab_test_file)

    def extract_features(df_rgb, df_hsv, df_lab):
        # Differential features (illumination correction via in-frame reference)
        diff_r = df_rgb['RedSample'] - df_rgb['RedReference']
        diff_g = df_rgb['GreenSample'] - df_rgb['GreenReference']
        diff_b = df_rgb['BlueSample'] - df_rgb['BlueReference']

        diff_h = df_hsv['HSample'] - df_hsv['HReference']
        diff_s = df_hsv['SSample'] - df_hsv['SReference']
        diff_v = df_hsv['VSample'] - df_hsv['VReference']

        diff_l = df_lab['LReference'] - df_lab['LSample']
        diff_a = df_lab['aReference'] - df_lab['aSample']
        diff_b_lab = df_lab['bReference'] - df_lab['bSample']
        delta_e = np.sqrt(diff_l**2 + diff_a**2 + diff_b_lab**2)

        features = pd.DataFrame({
            'RedRef': df_rgb['RedReference'],
            'GreenRef': df_rgb['GreenReference'],
            'BlueRef': df_rgb['BlueReference'],
            'RedSample': df_rgb['RedSample'],
            'GreenSample': df_rgb['GreenSample'],
            'BlueSample': df_rgb['BlueSample'],
            'Diff_Red': diff_r,
            'Diff_Green': diff_g,
            'Diff_Blue': diff_b,

            'HRef': df_hsv['HReference'],
            'SRef': df_hsv['SReference'],
            'VRef': df_hsv['VReference'],
            'HSample': df_hsv['HSample'],
            'SSample': df_hsv['SSample'],
            'VSample': df_hsv['VSample'],
            'Diff_H': diff_h,
            'Diff_S': diff_s,
            'Diff_V': diff_v,

            'LRef': df_lab['LReference'],
            'aRef': df_lab['aReference'],
            'bRef': df_lab['bReference'],
            'LSample': df_lab['LSample'],
            'aSample': df_lab['aSample'],
            'bSample': df_lab['bSample'],
            'Diff_L': diff_l,
            'Diff_a': diff_a,
            'Diff_b': diff_b_lab,
            'DeltaE': delta_e,
        })

        # Labels: Following paper's grouping (1-3: Low/Blank, 4-7: Moderate, 8-10: High)
        # Class 0: Negative/Blank (Dilution 1-3)
        # Class 1: Moderate Reaction (Dilution 4-7)
        # Class 2: Positive/High Saturation (Dilution 8-10)
        dilution = df_rgb['Dilution Factor'].values
        mapped_labels = []
        for d in dilution:
            if d <= 3:
                mapped_labels.append('NEGATIVE')
            elif d <= 7:
                mapped_labels.append('POSITIVE_MODERATE')
            else:
                mapped_labels.append('POSITIVE_STRONG')

        return features, np.array(mapped_labels), dilution

    X_train, y_train, dil_train = extract_features(df_rgb_tr, df_hsv_tr, df_lab_tr)
    X_test, y_test, dil_test = extract_features(df_rgb_te, df_hsv_te, df_lab_te)

    return X_train, y_train, X_test, y_test


def train():
    print("==================================================")
    print("TRAINING COLORIMETRIC MACHINE LEARNING CLASSIFIERS")
    print("==================================================")

    # 1. Load pesticide & food datasets
    X_train_pest, y_train_pest, X_test_pest, y_test_pest = load_and_merge_datasets('pesticide')
    X_train_food, y_train_food, X_test_food, y_test_food = load_and_merge_datasets('food')

    # Combine both datasets for general robust multi-analyte training
    X_train = pd.concat([X_train_pest, X_train_food], ignore_index=True)
    y_train = np.concatenate([y_train_pest, y_train_food])

    X_test = pd.concat([X_test_pest, X_test_food], ignore_index=True)
    y_test = np.concatenate([y_test_pest, y_test_food])

    print(f"Total Training Samples: {len(X_train)} across 27 colorimetric features")
    print(f"Total Test Samples: {len(X_test)}")
    print(f"Class Distribution: {pd.Series(y_train).value_counts().to_dict()}")

    # 2. Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 3. Train Random Forest (1000 trees as in NAAMII paper)
    print("\n[1/3] Training Random Forest Classifier (1000 estimators)...")
    rf = RandomForestClassifier(n_estimators=1000, max_depth=None, random_state=42, n_jobs=-1)
    rf.fit(X_train_scaled, y_train)
    rf_pred = rf.predict(X_test_scaled)
    rf_acc = accuracy_score(y_test, rf_pred)
    print(f"-> Random Forest Test Accuracy: {rf_acc * 100:.2f}%")

    # 4. Train Support Vector Classifier (RBF with probability estimates)
    print("\n[2/3] Training Support Vector Machine (SVC)...")
    svm = SVC(kernel='rbf', C=10.0, gamma='scale', probability=True, random_state=42)
    svm.fit(X_train_scaled, y_train)
    svm_pred = svm.predict(X_test_scaled)
    svm_acc = accuracy_score(y_test, svm_pred)
    print(f"-> SVM Test Accuracy: {svm_acc * 100:.2f}%")

    # 5. Train Logistic Regression (multinomial)
    print("\n[3/3] Training Logistic Regression...")
    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(X_train_scaled, y_train)
    lr_pred = lr.predict(X_test_scaled)
    lr_acc = accuracy_score(y_test, lr_pred)
    print(f"-> Logistic Regression Test Accuracy: {lr_acc * 100:.2f}%")

    # Pick best model (Random Forest typically achieves top results)
    best_model = rf if rf_acc >= svm_acc else svm
    best_name = "RandomForest" if rf_acc >= svm_acc else "SVM"
    best_acc = max(rf_acc, svm_acc)

    print("\n--------------------------------------------------")
    print(f"BEST MODEL SELECTED: {best_name} ({best_acc * 100:.2f}% Accuracy)")
    print("--------------------------------------------------")
    print(classification_report(y_test, rf_pred))

    # 6. Save model bundle
    bundle = {
        'model': best_model,
        'model_name': best_name,
        'scaler': scaler,
        'feature_names': X_train.columns.tolist(),
        'classes': best_model.classes_.tolist(),
        'rf_accuracy': float(rf_acc),
        'svm_accuracy': float(svm_acc),
        'lr_accuracy': float(lr_acc),
    }

    model_path = os.path.join(MODELS_DIR, 'colorimetric_model.joblib')
    joblib.dump(bundle, model_path)
    print(f"Saved trained model bundle to: {model_path}")
    return bundle


if __name__ == '__main__':
    train()
